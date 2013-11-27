seed = 9
random = ->
	x = Math.sin(seed++) * 10000;
	return x - Math.floor(x)

randomInt = (min, max)->
    min + Math.floor(random() * (max - min + 1))

randomFrom = (array)->
	array[Math.floor(random() * array.length)]